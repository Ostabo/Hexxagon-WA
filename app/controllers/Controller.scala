package controllers

import controller.controllerComponent.ControllerInterface
import play.api.mvc._

import javax.inject._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class Controller @Inject()(val controllerComponents: ControllerComponents) extends BaseController {

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
    Ok(views.html.gamePlain(controller.gamestatus.message()))
  }

  def overview(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.game())
  }

  def overviewPlain(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.gamePlain(controller.toString))
  }

  def place(x: Int, y: Int, stone: Char): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.place(stone.toUpper, x, y)
    Ok(controller.exportField)
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
}
