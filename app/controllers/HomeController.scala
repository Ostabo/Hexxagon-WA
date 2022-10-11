package controllers

import controller.controllerComponent.controllerBaseImpl.Controller
import play.api.mvc._

import javax.inject._
import scala.HexModule.given_model_fieldComponent_FieldInterface_Char

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {

  val controller = new Controller()

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
    Ok("Ok")
  }

  def place(x: Int, y: Int, stone: Char): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.place(stone, x, y)
    Ok(controller.hexfield.toString)
  }

  def notFound(page: String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    NotFound(
      <h1>
        Page not found:
        {page}
      </h1>
    )
  }
}
