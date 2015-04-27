# @cjsx React.DOM

$     = require 'jquery'
_     = require 'lodash'
React = require 'react/addons'
TimeoutTransitionGroup = require '../../libs/timeout-transition-group.jsx'

class Tile extends React.Component
  render: ->
    src = @props.src
    (
      <li className="album-cover">
        <TimeoutTransitionGroup transitionName="album-spinner"
                                enterTimeout={800}
                                leaveTimeout={500}>
          <img src={src} width="200" height="200" key={src} />
        </TimeoutTransitionGroup>
      </li>
    )

class Tiles extends React.Component
  propType:
    data: React.PropTypes.array

  tilesVisibleOnScreen: ->
    buffer = 5
    Math.floor((window.innerHeight * window.innerWidth) / (200 * 200)) + buffer

  render: ->
    subset = @props.data.slice 0, @tilesVisibleOnScreen()
    tileNodes = subset.map (track, index) =>
      (
        <Tile src={track.url} key={index} ></Tile>
      )
    (
      <ul className="album-covers">
        <TimeoutTransitionGroup transitionName="album-spinner"
                                enterTimeout={800}>
          {tileNodes}
        </TimeoutTransitionGroup>
      </ul>
    )

SpotifyBackground = React.createClass
  loadAlbumCoversFromServer: ->
    $.ajax
      url: @props.url
      dataType: 'json',
      success: (data) =>
        @setState { data: _.shuffle data }
        @setState { spinner: _.cloneDeep data }
      error: (xhr, status, err) ->
        console.error @props.url, status, err.toString()

  getInitialState: ->
    {data: []}

  animateTile: ->
    unless @state.spinner.length
      @setState {spinner: _.cloneDeep @state.data}
    spinnerCopy = _.cloneDeep @state.spinner
    dataCopy    = _.cloneDeep @state.data
    dataCopy[_.random(dataCopy.length - 1)] = spinnerCopy.pop()
    @setState {spinner: spinnerCopy, data: dataCopy}

  componentDidMount: ->
    @loadAlbumCoversFromServer()
    setInterval @animateTile, _.random(1500, 1700)

  render: ->
    (
      <div className="dynamic-background">
        <Tiles data={this.state.data} />
        <div className="gradient-overlay"></div>
      </div>
    )

module.exports = SpotifyBackground

