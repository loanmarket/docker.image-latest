import * as core from '@actions/core'
import {graphql} from '@octokit/graphql'
// import * as _ from 'lodash'
// import * as semver from 'semver'

async function run(): Promise<void> {
  try {
    const owner: string = core.getInput('github_owner', {required: true})
    const repoName: string = core.getInput('image_name', {required: true})
    const token: string = core.getInput('github_token', {required: true})
    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${token}`
      }
    })

    const {getLatest} = await graphqlWithAuth(
      `
      query getLatest($organisation: String!, $repoName: String!) {
        organization(login: $organisation) {
          packages(first: 100, names: [$repoName]) {
            nodes {
              id
              name
              versions(first: 100) {
                nodes {
                  version
                }
              }
              latestVersion {
                version
              }
            }
            totalCount
          }
        }
      }`,
      {
        owner,
        repoName
      }
    )
    console.log(JSON.stringify(getLatest))
    // axios
    //   .get(`https://hub.docker.com/v2/repositories/${imageName}/tags/`)
    //   .then(response => {
    //     const latest = _.last(
    //       _.remove(_.sortBy(_.map(response.data.results, 'name')), function(e) {
    //         return semver.validRange(e)
    //       })
    //     )
    //     core.setOutput('latest', latest)
    //     core.exportVariable('latest', latest)
    //   })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
