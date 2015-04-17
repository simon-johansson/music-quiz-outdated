# @cjsx React.DOM

React = require 'react/addons'
TimeoutTransitionGroup = require '../../libs/timeout-transition-group.jsx'

Tile = React.createClass
  render: ->
    src = @props.src
    (
      <li className="album-cover">
        <TimeoutTransitionGroup transitionName="example"
                                enterTimeout={800}
                                leaveTimeout={500}>
          <img src={src} width="200" height="200" key={src} />
        </TimeoutTransitionGroup>
      </li>
    )

Tiles = React.createClass
  propTypes:
    data: React.PropTypes.array

  tilesOnScreen: ->
    Math.floor((window.innerHeight * window.innerWidth) / (200 * 200)) + 5

  render: ->
    tileNodes = @props.data.map (track, index) =>
      (
        <Tile src={track.imageSrc} key={index} ></Tile>
      )
    (
      <ul>
        {tileNodes}
      </ul>
    )

SpotifyBackground = React.createClass

  loadAlbumCoversFromServer: ->
    $.ajax
      url: @props.url
      dataType: 'json',
      success: (data) =>
        data = data.map (e) ->
          {id: e.track.id, imageSrc: e.track.album.images[1].url}
        @setState { data: _.shuffle data }
        @setState { spinner: _.cloneDeep data }
      error: (xhr, status, err) ->
        console.error @props.url, status, err.toString()

  getInitialState: ->
    {data: []}

  animate: ->
    unless @state.spinner.length
      @setState {spinner: _.cloneDeep @state.data}
    # console.log @state.data.length
    # console.log @state.spinner.length
    spinnerCopy = _.cloneDeep @state.spinner
    dataCopy = _.cloneDeep @state.data
    dataCopy[_.random(dataCopy.length - 1)] = spinnerCopy.pop()
    @setState {spinner: spinnerCopy, data: dataCopy}

  componentDidMount: ->
    @loadAlbumCoversFromServer()
    setInterval @animate, _.random(1500, 1700)

  render: ->
    (
      <div className="background">
        <Tiles data={this.state.data} />
      </div>
    )

module.exports = SpotifyBackground

