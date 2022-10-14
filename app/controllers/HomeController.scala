package controllers

import controller.GameStatus
import controller.controllerComponent.ControllerInterface
import play.api.mvc._

import javax.inject._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {

  val controller: ControllerInterface[Char] = starter.runController

  /**
   * Create an Action to render an HTML page.
   *
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.index())
  }

  def about(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.about())
  }

  def status(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(controller.gamestatus.message())
  }

  def overview(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(
      views.html.game(
        controller.hexfield.matrix.matrix,
        controller.gamestatus.message(),
        controller.hexfield.matrix.Xcount.toString,
        controller.hexfield.matrix.Ocount.toString,
        if (controller.gamestatus.equals(GameStatus.TURNPLAYER1) || controller.gamestatus.equals(GameStatus.IDLE))
          0
        else
          1
      )
    )
  }

  def overviewPlain(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.gamePlain(controller.toString))
  }

  def place(x: Int, y: Int, stone: Char): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.place(stone.toUpper, x, y)
    Ok(controller.toString)
  }

  def fillAll(stone: Char): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.fillAll(stone.toUpper)
    Ok(controller.toString)
  }

  def undo(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.undo
    Ok(controller.toString)
  }

  def redo(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.redo
    Ok(controller.toString)
  }

  def save(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.save
    Ok(controller.toString)
  }

  def load(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.load
    Ok(controller.toString)
  }

  def reset(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.reset
    Ok(controller.toString)
  }

  def notFound(page: String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    NotFound(views.html.notFound(page))
  }
}
