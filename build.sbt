import com.typesafe.sbt.packager.docker.DockerChmodType
import com.typesafe.sbt.packager.docker.DockerPermissionStrategy

dockerChmodType := DockerChmodType.UserGroupWriteExecute
dockerPermissionStrategy := DockerPermissionStrategy.CopyChown

javacOptions ++= Seq("-source", "1.8", "-target", "1.8")

ThisBuild / scalaVersion := "2.13.10"
ThisBuild / version := "1.0"
ThisBuild / publishTo := Some("Docker Hub" at "docker.io/ostabo/hex")
Docker / packageName := "ostabo/hex"
dockerRepository := Some("docker.io")
publishArtifact := false


// standard tcp ports
dockerExposedPorts ++= Seq(9000, 9001)

// for udp ports
dockerExposedUdpPorts += 4444


scalacOptions += "-Ytasty-reader"

lazy val root = (project in file("."))
  .enablePlugins(PlayScala, SbtWeb, DockerPlugin)
  .settings(
    name := "Hexxagon-WA",
    includeFilter in(Assets, LessKeys.less) := "*.less",
    libraryDependencies ++= Seq(
      guice,
      ws,
      "org.scalatestplus.play" %% "scalatestplus-play" % "5.1.0" % Test
    )
  )