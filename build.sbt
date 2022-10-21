ThisBuild / scalaVersion := "2.13.10"

ThisBuild / version := "1.0"

scalacOptions += "-Ytasty-reader"

lazy val root = (project in file("."))
  .enablePlugins(PlayScala, SbtWeb)
  .settings(
    includeFilter in (Assets, LessKeys.less) := "*.less",
    libraryDependencies ++= Seq(
      guice,
      "org.scalatestplus.play" %% "scalatestplus-play" % "5.1.0" % Test
    )
  )