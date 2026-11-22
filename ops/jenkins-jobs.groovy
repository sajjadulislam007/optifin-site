// The website's Jenkins job (Job DSL). Installed by ops/install.sh to
// /opt/optifin/jenkins-jobs/extra-jobs.groovy, which the server's Jenkins loads.
// Its pipeline is ops/Jenkinsfile in this repository, always read from main, so a
// branch you pick to build cannot change what runs with deploy rights.

pipelineJob('optifin-site') {
  displayName('optifin-site')
  description('Optifin website. Build with Parameters: pick the branch and the environment. development = dev.optifin.app, live = optifin.app (main only, asks you to confirm).')
  parameters {
    gitParameter {
      name('BRANCH')
      type('PT_BRANCH')
      description('Git branch to build (every pushed branch appears here)')
      defaultValue('main')
      branch('')
      branchFilter('origin/(.*)')
      tagFilter('*')
      sortMode('DESCENDING_SMART')
      selectedValue('DEFAULT')
      useRepository('.*optifin-site.*')
      quickFilterEnabled(true)
      listSize('12')
    }
    choiceParam('ENVIRONMENT', ['development', 'live'], 'development = deploy to dev.optifin.app. live = main only, asks you to confirm, deploys to optifin.app.')
  }
  definition {
    cpsScm {
      scm {
        git {
          remote {
            url('https://github.com/sajjadulislam007/optifin-site.git')
          }
          branch('main')
        }
      }
      scriptPath('ops/Jenkinsfile')
      lightweight(true)
    }
  }
}
