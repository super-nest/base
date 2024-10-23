// Global Environment
switch(env.BRANCH_NAME) {
    case "dev":
        // Secret
        env.SECRET_FILE_ID = '6a4dbbb8-e2a6-4c99-9394-a80cdcde384f'
        // Server
        env.SERVER_CREDENTIALS = '5e7982bd-6f22-4cb5-961d-3c18032ed467'
        env.SERVER_USERNAME = 'ubuntu'
        env.SERVER_ADDRESS = '42.112.59.88'
        env.SERVER_PATH = '/home/ubuntu/liem/tongram-be'
        break
    case "staging":
        // Secret
        env.SECRET_FILE_ID = '2a4986e7-7eee-4d48-a1c2-e1bd09ffbf63'
        // Server
        env.SERVER_CREDENTIALS = '5e7982bd-6f22-4cb5-961d-3c18032ed467'
        env.SERVER_USERNAME = 'ubuntu'
        env.SERVER_ADDRESS = '42.112.59.88'
        env.SERVER_PATH = '/home/ubuntu/staging/tongram-be'
        break
    case "production":
        // Secret
        env.SECRET_FILE_ID = 'c6e7e7d3-585a-48b6-8230-999b595f7f58'
        // Server
        env.SERVER_CREDENTIALS = '71d83386-3fdb-45c0-9fd0-5085726840b0'
        env.SERVER_USERNAME = 'ubuntu'
        env.SERVER_ADDRESS = '3.1.82.71'
        env.SERVER_PATH = '/home/ubuntu/tongram-be'
        break
    default:
        // Secret
        env.SECRET_FILE_ID = '6a4dbbb8-e2a6-4c99-9394-a80cdcde384f'
        // Server
        env.SERVER_CREDENTIALS = '5e7982bd-6f22-4cb5-961d-3c18032ed467'
        env.SERVER_USERNAME = 'ubuntu'
        env.SERVER_ADDRESS = '42.112.59.88'
        env.SERVER_PATH = '/home/ubuntu/liem/tongram-be'
        break
}

pipeline {
    agent any
    environment {
        // Github
        GITHUB_URL = 'https://github.com/playgroundvina/tongram-be.git'
        GITHUB_CREDENTIAL_ID = '4113d2cf-0e7f-458f-b8f9-687ec233c2f4'
        // Dockerhub
        DOCKER_URL = 'https://hub.playgroundvina.com/'
        DOCKER_HUB_CREDENTIALS_ID = 'eeaa327e-4f33-4f7d-bfda-016f138a659d'
        // Telegram configuration
        TOKEN = credentials('b4a49b21-4caa-4f7a-834b-ffa7d6b9c41e')
        CHAT_ID = credentials('69503db3-8106-40c6-8bd0-876b2eb2adb7')
    }
    stages {
        stage('Notification') {
            steps {
                sh "make notify_start JOB_NAME=${env.JOB_NAME} BUILD_NUMBER=${env.BUILD_NUMBER} CHAT_ID=${env.CHAT_ID} TOKEN=${env.TOKEN}"
            }
        }
        stage('Checkout code') {
            steps {
                git branch: "${env.BRANCH_NAME}", url: "${GITHUB_URL}", credentialsId: "${GITHUB_CREDENTIAL_ID}"
            }
        }
        stage('Setup Environment') {
            steps {
                withCredentials([file(credentialsId: env.SECRET_FILE_ID, variable: 'SECRET_FILE')]) {
                    sh '''
                    rm -rf .env
                    cp $SECRET_FILE .env
                    chmod 644 .env
                    '''
                }
            }
        }
        stage('Build & Push Docker Image') {
            steps {
                sh "make build"
                withDockerRegistry([url: "${DOCKER_URL}", credentialsId: "${DOCKER_HUB_CREDENTIALS_ID}"]) {
                    sh "make push"
                }
            }
        }
        stage('Deploying...') {
            when {
                anyOf {
                    branch 'dev'
                    branch 'staging'
                    branch 'production'
                }
            }
            steps {
                script {
                    echo "Deploying to '${env.BRANCH_NAME}'..."
                    withCredentials([file(credentialsId: env.SECRET_FILE_ID, variable: 'SECRET_FILE')]) {
                        sshagent([env.SERVER_CREDENTIALS]) {
                            def commands = """
                            cd ${env.SERVER_PATH}
                            sudo make stop
                            git pull
                            sudo make setup-env
                            sudo make pull
                            sudo make start
                            """
                            // Remove old .env
                            sh "ssh -o StrictHostKeyChecking=no -l ${env.SERVER_USERNAME} ${env.SERVER_ADDRESS} rm -rf .env"
                            // Copy .env
                            sh "scp -o StrictHostKeyChecking=no $SECRET_FILE ${env.SERVER_USERNAME}@${env.SERVER_ADDRESS}:${env.SERVER_PATH}/.env"
                            // Start
                            sh "ssh -o StrictHostKeyChecking=no -l ${env.SERVER_USERNAME} ${env.SERVER_ADDRESS} '${commands}'"
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                def status = currentBuild.result ?: 'SUCCESS'
                sh "make notify_${status.toLowerCase()} JOB_NAME=${env.JOB_NAME} BUILD_NUMBER=${env.BUILD_NUMBER} CHAT_ID=${env.CHAT_ID} TOKEN=${env.TOKEN}"
                sh '''
                make clean
                find . -mindepth 1 ! -name 'Makefile' -exec rm -rf {} +
                '''
            }
        }
    }
}
