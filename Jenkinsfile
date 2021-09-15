def scmVars
def CLUSTER
def SERVICE_NAME

def REGISTRY = "943960050284.dkr.ecr.us-east-1.amazonaws.com"
def IMAGE = "eo-ms-orderos"
def PROD_REGISTRY = "619322248905.dkr.ecr.us-east-1.amazonaws.com"

node {
  stage('clear cache') {
    sh 'rm  ~/.dockercfg || true'
    sh 'rm ~/.docker/config.json || true'
  }

  stage('Clone repository'){
    scmVars = checkout scm
  }

  stage('Set cluster and service name'){
    echo scmVars.GIT_BRANCH
    if (scmVars.GIT_BRANCH == 'origin/usa/development') {
      CLUSTER="eatos-dev"
      SERVICE_NAME="eo-ms-orderos-dev"
      echo CLUSTER
    } else if (scmVars.GIT_BRANCH == 'origin/usa/production') {
      CLUSTER="eatos-prod"
      SERVICE_NAME="eo-ms-orderos-prod"
      REGISTRY=PROD_REGISTRY
      echo CLUSTER
    } else if (scmVars.GIT_BRANCH == 'origin/usa/staging') {
      CLUSTER="eatos-stg"
      SERVICE_NAME="eo-ms-orderos-stg"
      echo CLUSTER
    }
  }

  stage('Build image'){
    dockerImage = REGISTRY + "/" + IMAGE
    echo dockerImage
    app = docker.build(dockerImage)
  }

  stage("Push image to registry"){
    dockerRegistry = "http://" + REGISTRY
    docker.withRegistry(dockerRegistry, 'ecr:us-east-1:ecr-aws'){
      app.push("${env.BUILD_NUMBER}")
      app.push("latest")
    }
  }
  stage("Deploy application"){
    sh "aws ecs update-service --cluster ${CLUSTER} --service ${SERVICE_NAME} --force-new-deployment"
  }

  stage("Clear "){
    sh "docker rmi ${REGISTRY}/${IMAGE}:${env.BUILD_NUMBER} -f"
    sh "docker rmi ${REGISTRY}/${IMAGE}:latest -f"
  }
}