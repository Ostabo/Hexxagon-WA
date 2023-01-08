package controllers

import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import akka.stream.Materializer
import controller.GameStatus
import controller.controllerComponent.ControllerInterface
import play.api.libs.streams.ActorFlow
import play.api.mvc._

import java.time.LocalDateTime
import javax.inject._
import scala.collection.mutable.ListBuffer
import scala.concurrent.ExecutionContext
import scala.concurrent.duration.DurationInt

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class Controller @Inject()(val controllerComponents: ControllerComponents)(implicit system: ActorSystem, mat: Materializer, executionContext: ExecutionContext) extends BaseController {

  private final val WS_KEEP_ALIVE_EVENT = "ping"
  private final val WS_KEEP_ALIVE_RESPONSE = "Keep alive"
  private final val WS_REQUEST_PLAYER_EVENT = "Requesting player number"
  private final val WS_RESPONSE_PLAYER_EVENT = "Player number: "
  val controller: ControllerInterface[Char] = starter.runController
  private val clientList: ListBuffer[ActorRef] = ListBuffer()
  var chat: String = ""

  // Cron job to keep render container running
  system.scheduler.scheduleAtFixedRate(initialDelay = 10.minutes, interval = 14.minutes) { () =>
    println(LocalDateTime.now() + " - Keep alive in Production")
  }

  /**
   * Create an Action to render an HTML page.
   *
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.index(
      controller.hexfield.matrix.matrix,
      controller.hexfield.matrix.Xcount.toString,
      controller.hexfield.matrix.Ocount.toString
    ))
  }

  def about(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.about())
  }

  def status(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.gamePlain(controller.gamestatus.message()))
  }

  def overviewPlain(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.gamePlain(controller.toString))
  }

  def gamePlain(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(controller.toString)
  }

  def statusPlain(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(controller.gamestatus.message())
  }

  def game(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(controller.exportField)
  }

  def place(x: Int, y: Int, stone: Char): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    if (controller.gamestatus.equals(GameStatus.GAMEOVER)) {
      NotAcceptable("Game is over!\n Reset the game to play again.")
    } else if (controller.gamestatus.equals(GameStatus.TURNPLAYER2) && stone.equals('X')
      || controller.gamestatus.equals(GameStatus.TURNPLAYER1) && stone.equals('O')) {
      NotAcceptable("Wrong Player!")
    } else if (!controller.hexfield.matrix.cell(x, y).equals(' ')) {
      NotAcceptable("Cell is occupied!")
    } else {
      controller.place(stone.toUpper, x, y)
      Ok(controller.exportField)
    }
  }

  def fillAll(stone: Char): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.fillAll(stone.toUpper)
    Ok(controller.exportField)
  }

  def undo(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.undo
    Ok(controller.exportField)
  }

  def redo(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.redo
    Ok(controller.exportField)
  }

  def save(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.save
    Ok(controller.exportField)
  }

  def load(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.load
    Ok(controller.exportField)
  }

  def reset(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.reset
    Ok(controller.exportField)
  }

  def notFound(page: String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    NotFound(views.html.notFound(page))
  }

  def chatGet(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(chat)
  }

  def chatPost(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    chat = request.body.asText.getOrElse(request.body.asJson.get("message").asOpt[String].get)
    println(chat)
    Ok(chat)
  }

  def socket: WebSocket = WebSocket.accept[String, String] { _ =>
    println("Client connected")
    ActorFlow.actorRef { out =>
      HexxagonWebSocketActorFactory.create(out)
    }
  }

  class HexxagonWebSocketActor(out: ActorRef) extends Actor {
    clientList += out
    println("Clients: " + clientList.size)

    def receive: Receive = {
      case WS_KEEP_ALIVE_EVENT => out ! WS_KEEP_ALIVE_RESPONSE
      case WS_REQUEST_PLAYER_EVENT => out ! WS_RESPONSE_PLAYER_EVENT + (clientList.toList.indexOf(out) + 1)
      case _ => clientList.foreach(_ ! controller.exportField)
    }

    override def postStop(): Unit = {
      println("Client disconnected")
      val oldIndex = clientList.toList.indexOf(out)
      clientList -= out
      for (i <- oldIndex + 1 to clientList.size) {
        clientList(i - 1) ! WS_RESPONSE_PLAYER_EVENT + i
      }
      println("Clients: " + clientList.size)
    }

  }

  object HexxagonWebSocketActorFactory {

    def create(out: ActorRef): Props = {
      Props(new HexxagonWebSocketActor(out))
    }

  }
}


