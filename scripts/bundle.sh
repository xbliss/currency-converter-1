#!/bin/bash
modules="
module
require-chrome
logger
null-logger
forex
highlighter
application
"
name="Currency Converter"
description="Get prices in your local currency (currently only PLN to GBP, EUR and USD are supported"
version="0.1"

manifest="{
  \"name\": \"$name\",
  \"description\" : \"$description\",
  \"version\": \"$version\",

  \"manifest_version\": 2,

  \"browser_action\": {
    \"default_icon\": \"icons/64x64.png\",
    \"default_title\": \"Currency Converter\"
  },
  \"icons\": {
    \"16\": \"icons/16x16.png\",
    \"64\": \"icons/64x64.png\",
    \"128\": \"icons/128x128.png\"
  },
  \"background\": {
    \"scripts\": [
      \"dist/bundle.js\",
      \"main.js\"
    ]
  },
  \"content_scripts\": [ {
    \"all_frames\": true,
    \"js\": [
      \"dist/bundle.js\",
      \"front.js\"
    ],
    \"matches\": [ \"http://*/*\", \"file://*/*\" ]
  } ],
  \"permissions\": [
    \"activeTab\",
    \"tabs\",
    \"storage\",
    \"http://*/\",
    \"file://*/\"
  ]
}"

echo '' > dist/bundle.js;
for i in $modules; do 
    cat lib/$i.js >> dist/bundle.js; 
done

echo $manifest > manifest.json