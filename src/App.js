import React, { useState, createRef, useEffect } from 'react';
import './style.scss';
import {
  ReplyIcon,
  RetweetIcon,
  ShareIcon,
  VerifiedIcon,
  LikeIcon,
} from './icons';
import { AvatarLoader } from './loaders';
import { useScreenshot } from 'use-react-screenshot';
import { lang } from './languages';

function convertImgToBase64(url, callback, outputFormat) {
  var canvas = document.createElement('CANVAS');
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function () {
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL(outputFormat || 'image/png');
    callback.call(this, dataURL);
    canvas = null;
  };
  img.src = url;
}

const tweetFormat = (tweet) => {
  tweet = tweet
    .replace(/@([\w]+)/g, '<span>@$1</span>')
    .replace(/#([\wşçöğüıİ]+)/gi, '<span>#$1</span>')
    .replace(/(https?:\/\/[\w\.\/]+)/, '<span>$1</span>');
  return tweet;
};

const numberFormat = (number) => {
  if (!number) number = 0;
  if (number < 1000) return number;
  number /= 1000;
  number = String(number).split('.');
  return (
    number[0] + (number[1] > 100 ? ',' + number[1].slice(0, 1) + ' B' : ' B')
  );
};

export default function App() {
  const tweetRef = createRef(null);
  const downloadRef = createRef();
  const [name, setName] = useState();
  const [username, setUsername] = useState();
  const [isVerified, setIsVerified] = useState(0);
  const [tweet, setTweet] = useState();
  const [avatar, setAvatar] = useState();
  const [retweet, setRetweet] = useState(0);
  const [quoteTweets, setQuoteTweets] = useState(0);
  const [likes, setLikes] = useState(0);
  const [filename, setFileName] = useState();
  const [language, setLanguage] = useState('tr');
  const [languageText, setLanguageText] = useState(lang[language]);
  const [image, takeScreenshot] = useScreenshot();
  const getImage = () => takeScreenshot(tweetRef.current);

  useEffect(() => {
    setLanguageText(lang[language]);
  }, [language]);

  useEffect(() => {
    if (image) {
      downloadRef.current.click();
    }
  }, [image]);

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.addEventListener('load', function () {
      setAvatar(this.result);
      setFileName(file.name);
    });

    reader.readAsDataURL(file);
  };

  const fetchTwitterInfo = () => {
    fetch(
      `https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search?q=${username}`
    )
      .then((res) => res.json())
      .then((data) => {
        const twitter = data[0];

        convertImgToBase64(
          twitter.profile_image_url_https,
          function (base64Image) {
            setAvatar(base64Image);
          }
        );

        setName(twitter.name);
        setUsername(twitter.screen_name);
        setTweet(twitter.status.text);
        setRetweet(twitter.status.retweet_count);
        setLikes(twitter.status.favorite_count);
      });
  };



  return (
    <>
      <div className="tweet-settings">
        <h3>{languageText?.settings}</h3>
        <ul>
          <li>
            <label>{languageText?.name}</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </li>
          <li>
            <label>{languageText?.username}</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </li>
          <li>
            <label>Tweet</label>
            <textarea
              className="textarea"
              maxlength="290"
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
            />
          </li>
          <li>
            <label for="file-upload" class="custom-file-upload">
              Avatar
            </label>
            <input
              id="file-upload"
              type="file"
              className="input"
              onChange={handleAvatar}
            />
            <span id="file-name">
              {(avatar && filename) || languageText?.no_file}
            </span>
          </li>
          <li>
            <label>Retweet</label>
            <input
              type="number"
              min="0"
              className="input"
              value={retweet}
              onChange={(e) => setRetweet(e.target.value)}
            />
          </li>
          <li>
            <label>{languageText?.quote}</label>
            <input
              type="number"
              min="0"
              className="input"
              value={quoteTweets}
              onChange={(e) => setQuoteTweets(e.target.value)}
            />
          </li>
          <li>
            <label>{languageText?.like}</label>
            <input
              type="number"
              min="0"
              className="input"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
            />
          </li>
          <li>
            <label>{languageText?.verified}</label>
            <select
              onChange={(e) => setIsVerified(e.target.value)}
              defaultValue={isVerified}
            >
              <option value="1">{languageText?.yes}</option>
              <option value="0">{languageText?.no}</option>
            </select>
          </li>
          <button onClick={getImage}>{languageText?.create}</button>
          <div className="download-url">
            {image && (
              <a ref={downloadRef} href={image} download="tweet.png"></a>
            )}
          </div>
        </ul>
      </div>
      <div className="tweet-container">
        <div className="app-language">
          <span
            onClick={() => setLanguage('tr')}
            className={language === 'tr' && 'active'}
          >
            TR
          </span>
          <span
            onClick={() => setLanguage('en')}
            className={language === 'en' && 'active'}
          >
            EN
          </span>
        </div>
        {/* <div className="fetch-info">
          <input
            id="fetchInput"
            type="text"
            placeholder={languageText?.fetch_text}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          /> */}
        {/* <button type="submit" onClick={fetchTwitterInfo}>{languageText?.fetch}</button> */}
        {/* </div> */}
        <div className="tweet" ref={tweetRef}>
          <div className="tweet-author">
            {(avatar && <img src={avatar} />) || <AvatarLoader />}
            <div>
              <div className="name">
                {name || 'Ad-Soyad'}{' '}
                {isVerified == 1 && <VerifiedIcon width="19" height="19" />}
              </div>
              <div className="username">@{username || languageText?.tag} </div>
            </div>
          </div>
          <div className="tweet-content">
            <p
              dangerouslySetInnerHTML={{
                __html:
                  (tweet && tweetFormat(tweet)) || languageText?.example_tweet,
              }}
            ></p>
          </div>
          <div className="tweet-stats">
            <span>
              <b>{numberFormat(retweet)}</b> Retweet
            </span>

            <span>
              <b>{numberFormat(quoteTweets)}</b> {languageText?.quote}
            </span>

            <span>
              <b>{numberFormat(likes)}</b> {languageText?.like}
            </span>
          </div>
          <div className="tweet-actions">
            <span>
              <ReplyIcon />
            </span>
            <span>
              <RetweetIcon />
            </span>
            <span>
              <LikeIcon />
            </span>
            <span>
              <ShareIcon />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
