export default class NewsList {
  constructor(data) {
    this.data = data;
    this.newsListContainer = document.createElement('div');
    this.newsListContainer.className = 'news-list-container';

    this.newsListArticle = document.createElement('article');
    this.newsListArticle.className = 'news-list';
    this.newsListArticle.dataset.category = data.category;
    this.newsListContainer.appendChild(this.newsListArticle);

    this.scrollObserverElement = this.observerElement();
    this.newsListContainer.appendChild(this.scrollObserverElement);

    this.scrollObserver(this.newsListArticle, this.scrollObserverElement);
  }

  async updateNewsList() {
    const newsList = await this.getNewsList(this.data);
    newsList.forEach((item) => {
      this.newsListArticle.appendChild(item);
    });
  }

  async getNewsList(page = 1, category , pageSize=5) {
    const newsArr = [];
    const NEWS_API_KEY = '4b5fcfae84d64b68ab6bd73c347c8004';
    const url = `https://newsapi.org/v2/top-headlines?country=kr&category=${
      category === 'all' ? '' : category
    }&page=${page}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;

    try {
      const response = await axios.get(url);
      const articles = response.data.articles;

      articles.forEach((data) => {
        if (data.urlToImage === null) {
          data.urlToImage =
            'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
        }

        if (data.description === null) {
          data.description = '';
        }

        const newsItem = document.createElement('section');
        newsItem.className = 'news-item';
        newsItem.insertAdjacentHTML(
          'beforeend',
          `
                  <div class="thumbnail">
                      <a href=${data.url} target="_blank" 
                      rel="noopener noreferrer">
                          <img
                          src=${data.urlToImage}
                          alt="thumbnail" />
                      </a>
                  </div>
                  <div class="contents">
                      <h2>
                          <a href=${data.url} target="_blank" 
                          rel="noopener noreferrer">
                          ${data.title}
                          </a>
                      </h2>
                      <p>
                      ${data.description}
                      </p>
                  </div>
              `,
        );
        newsArr.push(newsItem);
      });
      return newsArr;
    } catch (error) {
      // console.log(error);
      return [];
    }
  }

  observerElement() {
    const observerElement = document.createElement('div');
    observerElement.className = 'scroll-observer';
    observerElement.dataset.page = '1';

    const observerImg = document.createElement('img');
    observerImg.src = './img/ball-triangle.svg';
    observerImg.alt = 'Loading...';

    observerElement.appendChild(observerImg);

    return observerElement;
  }

  scrollObserver(newsListArticle, scrollObserverElement) {
    const callback = async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const nextPage = parseInt(entry.target.dataset['page']);
          const category = newsListArticle.dataset.category;

          const newsList = await this.getNewsList(nextPage, category);
          entry.target.dataset['page'] = nextPage + 1;

          if (newsList.length > 0) {
            newsList.forEach((data) => {
              newsListArticle.appendChild(data);
            });
            continue;
          }
          io.unobserve(entry.target);
          entry.target.remove();
        }
      }
    };
    const io = new IntersectionObserver(callback, { threshold: 0.8 });
    io.observe(scrollObserverElement);
  }

  get element() {
    return this.newsListContainer;
  }
}
