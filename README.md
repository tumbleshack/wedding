# McKay and Lily's Wedding

## Toolchain

1. Install gulp
```
$ npm install -g gulp
```

2. Install node modules (watch out)
```
$ npm install
```

3. Install gems
```
$ bundle
```

## Debug Environment

By default, gulp will run browser sync and watch.
```
$ gulp
```

## Production Build
```
$ gulp build
```

## Deploy

Any pushes to the master branch (including PR's), will trigger a github action which deploys the site.
