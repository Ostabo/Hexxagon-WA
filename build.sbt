ThisBuild / scalaVersion := "2.13.10"

ThisBuild / version := "1.0-SNAPSHOT"

scalacOptions += "-Ytasty-reader"

lazy val root = (project in file("."))
  .enablePlugins(PlayScala)
  .settings(
    name := """Hexxagon-WA""",
    libraryDependencies ++= Seq(
      guice,
      "org.scalatestplus.play" %% "scalatestplus-play" % "5.1.0" % Test
    )
  )