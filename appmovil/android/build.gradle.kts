allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

// Build fuera del proyecto para evitar bloqueos por OneDrive/ruta larga en Documents
val tempRoot = java.io.File(System.getenv("TEMP") ?: System.getProperty("java.io.tmpdir")!!, "classbridge_appmovil_build")
rootProject.layout.buildDirectory.set(rootProject.file(tempRoot))

subprojects {
    project.layout.buildDirectory.set(project.file(java.io.File(tempRoot, project.name)))
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
