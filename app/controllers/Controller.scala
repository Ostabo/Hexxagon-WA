package controllers

import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import akka.stream.Materializer
import controller.GameStatus
import controller.controllerComponent.ControllerInterface
import play.api.libs.streams.ActorFlow
import play.api.mvc._

import javax.inject._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class Controller @Inject()(val controllerComponents: ControllerComponents)(implicit system: ActorSystem, mat: Materializer) extends BaseController {

  val controller: ControllerInterface[Char] = starter.runController
  var chat: String = ""
  private var clientList: List[ActorRef] = List()

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
      controller.gamestatus match {
        case GameStatus.TURNPLAYER1 => "Player 1's turn"
        case GameStatus.TURNPLAYER2 => "Player 2's turn"
        case GameStatus.GAMEOVER => "GAME OVER"
        case _ => "Player 1's turn"
      },
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
    chat = request.body.asText.getOrElse("")
    println(chat)
    Ok(chat)
  }

  def socket: WebSocket = WebSocket.accept[String, String] { _ =>
    ActorFlow.actorRef { out =>
      println("Connect received")
      HexxagonWebSocketActorFactory.create(out)
    }
  }

  class HexxagonWebSocketActor(out: ActorRef) extends Actor {
    clientList = out :: clientList

    def receive: Receive = {
      case "ping" => out ! "Keep alive"
      case _ => clientList.foreach(_ ! controller.exportField)
    }

    override def postStop(): Unit = {
      println("Client disconnected")
    }

  }

  object HexxagonWebSocketActorFactory {

    def create(out: ActorRef): Props = {
      Props(new HexxagonWebSocketActor(out))
    }

  }
}


