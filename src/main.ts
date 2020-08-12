import * as core from '@actions/core'
import {graphql} from '@octokit/graphql'
import * as _ from 'lodash'
import * as semver from 'semver'

async function run(): Promise<void> {
  try {
    const organisation: string = core.getInput('github_owner', {required: true})
    const repoName: string = core.getInput('image_name', {required: true})
    const token: string = core.getInput('github_token', {required: true})
    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${token}`
      }
    })

    const {organization} = await graphqlWithAuth(
      `query getLatest($organisation: String!, $repoName: String!) {
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
          }
        }
      }`,
      {
        organisation,
        repoName
      }
    )

    const versions: string[] = []

    console.log(organization)
    console.log(organization?.packages)
    console.log(organization?.packages?.nodes[0])
    console.log(organization?.packages?.nodes[0]?.versions)
    console.log(organization?.packages?.nodes[0]?.versions?.nodes)
    console.log(organization?.packages?.nodes[0]?.versions?.nodes?.version)
    const nodes = organization?.packages?.nodes[0]?.versions?.nodes

    _.map(nodes, node => {
      versions.push(node.version)
    })

    // const versions = organization?.packages?.nodes[0]?.versions?.nodes?.version

    console.log('versions', versions)
    _.map(versions, function(e) {
      console.log(e)
      console.log(semver.validRange(e))
    })
    const latest =
      _.first(
        _.filter(versions, function(e) {
          console.log(e)
          console.log(semver.validRange(e))
          return semver.validRange(e)
        })
      ) ?? '0.0.1'
    console.log(latest)

    core.setOutput('latest', latest)
    core.exportVariable('latest', latest)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
