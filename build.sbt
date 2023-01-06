import com.typesafe.sbt.packager.docker.DockerChmodType
import com.typesafe.sbt.packager.docker.DockerPermissionStrategy

dockerChmodType := DockerChmodType.UserGroupWriteExecute
dockerPermissionStrategy := DockerPermissionStrategy.CopyChown

javacOptions ++= Seq("-source", "1.6", "-target", "1.6")

ThisBuild / scalaVersion := "2.13.10"

ThisBuild / version := "1.0"

packageName in Docker := "ostabo/hex"

scalacOptions += "-Ytasty-reader"

lazy val root = (project in file("."))
  .enablePlugins(PlayScala, SbtWeb)
  .settings(
    name := "Hexxagon-WA",
    includeFilter in(Assets, LessKeys.less) := "*.less",
    libraryDependencies ++= Seq(
      guice,
      "org.scalatestplus.play" %% "scalatestplus-play" % "5.1.0" % Test
    )
  )