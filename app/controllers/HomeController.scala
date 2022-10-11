package controllers

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

  def status(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(controller.gamestatus.toString)
  }

  def place(x: Int, y: Int, stone: Char): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.place(stone, x, y)
    Ok(controller.toString)
  }

  def notFound(page: String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    NotFound(views.html.notFound(page))
  }
}
