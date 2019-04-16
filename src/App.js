import React, { Component } from 'react';
import './App.css';

const MEDIA_URL = '/wp-json/wp/v2/media?per_page=100';
const PAGE_URL = '/wp-json/wp/v2/pages?per_page=100';
const POST_URL = '/wp-json/wp/v2/posts?per_page=100';


class App extends Component {
  state = {
    url: '',
    description: null,
    main: [],
    posts: [],
    postCount: 0,
    pages: [],
    pageCount: 0,
    images: [],
    imageCount: 0,
    nextPage: 1
  }

  handleOnMediaButtonClick = this.handleOnMediaButtonClick.bind(this)


  handleChange = (e) => {
    this.setState({ url: e.target.value })
  }

  handleClick = () => {
    this.getData()
  }

  getData() {

    const url = this.state.url;
    const pagesUrl = url + PAGE_URL;
    const postsUrl = url + POST_URL;
    const mediaUrl = url + MEDIA_URL;

    fetch(url + '/wp-json')
      .then(response => response.json())
      .then(data => {
        this.setState({
          main: data,
          url: data.url,
          description: data.description
        });
      })

    fetch(pagesUrl)
      .then(response => response.json())
      .then(data => {
        this.setState({
          pages: data,
          pageCount: data.length
        });
      })

    fetch(postsUrl)
      .then(response => response.json())
      .then(data => {
        this.setState({
          posts: data,
          postCount: data.length
        });
      })

    fetch(mediaUrl)
      .then(response => response.json())
      .then(data => {
        const images = data.filter(this.filterImagesByMediaType);
        this.setState({
          images,
          imageCount: images.length
        });
      })


  }

  filterImagesByMediaType = (data) => {
    return data.media_type === 'image';
  }


  handleOnMediaButtonClick() {
    this.setState(function (state) {
      return {
        nextPage: state.nextPage + 1
      }
    }, function () {
      this.getMediaNextPage()
    })
  }

  getMediaNextPage() {
    fetch(`${this.state.url}${MEDIA_URL}&page=${this.state.nextPage}`)
      .then(response => response.json())
      .then(data => {
        const newImages = data.filter(this.filterImagesByMediaType);
        const allImages = this.state.images.concat(newImages);
        const images = allImages.filter((images, index, self) =>
          index === self.findIndex((image) => (
            image.id === images.id)));
        this.setState({
          images,
          imageCount: images.length
        });
      })
      .catch(error => console.log('Error: ' + error))
  }

  render() {
    const { url, description, pageCount, postCount, imageCount } = this.state;

    const pages = <ul>{this.state.pages.map(page => {
      return (
        <li key={'page-' + page.id}>{page.link}</li>
      )
    })}</ul>

    const posts = <ul>{this.state.posts.map(post => {
      return (
        <li key={'post-' + post.id}>{post.link}</li>
      )
    })}</ul>

    const images = <ul className="thumbnails">{this.state.images.map(image => {
      return (
        <li key={'media-' + image.id}><a href={image.guid.rendered} target="_blank" rel="noopener noreferrer">

          {image.media_details ?
            image.media_details.sizes ?
              image.media_details.sizes.thumbnail ?
                <img alt={image.alt_text} src={image.media_details.sizes.thumbnail.source_url} width='150' height='150' />
                : <img alt={image.alt_text} src={image.source_url} width='150' height='150' />
              : <img alt={image.alt_text} src={image.source_url} width='150' height='150' />
            : <img alt={image.alt_text} src={image.source_url} width='150' height='150' />
          }
        </a> <span className="alt-text">{image.alt_text}</span></li>)

    })}</ul>



    return (
      <div className="app">
        <div>
          <label htmlFor="input">Enter a url: </label>
          <input id="input" type="url" onChange={this.handleChange} />
          <button onClick={this.handleClick}>Submit</button>
        </div>
        <p>Site: {url}</p>
        <p>Tagline: {description}</p>
        <p>Pages: {pageCount}</p>
        <p>Posts: {postCount}</p>
        <section>
          <h2>Pages ({pageCount})</h2>
          {pages}
        </section>
        <section>
          <h2>Posts ({postCount})</h2>
          {posts}
        </section>
        <section>
          <h2>Images ({imageCount})</h2>
          {images}
          <button className="imageButton" onClick={this.handleOnMediaButtonClick}>Show more</button>
        </section>
      </div>
    );
  }
}

export default App;
