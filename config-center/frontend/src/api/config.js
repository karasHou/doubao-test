import request from '../utils/request'

export function getConfigList(params) {
  return request({
    url: '/configs',
    method: 'get',
    params
  })
}

export function getConfig(id) {
  return request({
    url: `/configs/${id}`,
    method: 'get'
  })
}

export function createConfig(data) {
  return request({
    url: '/configs',
    method: 'post',
    data
  })
}

export function updateConfig(id, data) {
  return request({
    url: `/configs/${id}`,
    method: 'put',
    data
  })
}

export function deleteConfig(id) {
  return request({
    url: `/configs/${id}`,
    method: 'delete'
  })
}

export function getConfigVersions(configId) {
  return request({
    url: `/configs/${configId}/versions`,
    method: 'get'
  })
}

export function pullConfig(params) {
  return request({
    url: '/configs/pull',
    method: 'get',
    params
  })
}