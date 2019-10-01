---
title: 'Having fun in the eternal fight against the ads'
date: "2019-10-01T18:30:32.169Z"
template: "post"
draft: false
slug: "/posts/having-fun-in-the-eternal-fight-against-the-ads/"
category: "Javascript"
tags:
  - "programming"
  - "javascript"
  - "DOM"
  - "DOM manipulation"
  - "adblocker"
  - "elpais"
  - "chrome extension"
description: "I find a new anti adblock warning on my usual news webpage and figure how to remove the warning by using javascript"
socialImage: "/media/gary-clark-jr-2019.jpg"
---

I usually read news on [elpais.com](https://elpais.com). I reach them through Twitter links because it's one of the news account I follow.

Some time ago they added a big anti adblock banner in the middle of the page that was displayed every time you loaded a page if you had adblock installed and enabled. At that time I didn't know the adblock feature that includes an option in the contextual menu to block an element on the page, so I created [my own and personal chrome extension](https://chrome.google.com/webstore/detail/agm-chrome-extension/bpjmkofdilcfhaafpkokkanpppcblddf) and added a script that is executed only on `elpais.com` domains, and disables the banner.

The code removes the banner element and enables scrolling again:

```javascript
const overlay = document.querySelector('.fc-ab-root')
overlay.parentElement.removeChild(overlay)
document.body.style.overflow = 'scroll'
```

It was simple because the class was always the same.

But today I visited their page, following some random link on Twitter, and this is what I found...

![Anti adblock elpais.com](/media/anti-adblock-01.jpg)

Yeeep... there we go again...

But it doesn't matter. I always enjoy the opportunity to open Chrome Dev Tools and play with Javascript and the DOM.

When I inspect the element I find this time it uses a random class name.

If we check the classes of the div elements in the page we notice that there are a lot of divs at the end of the page with random class names.

```javascript
// code to get and print all classes used by div elements in the page
let classes = [];
document.querySelectorAll('div').forEach(el => {
  classes = [...classes, ...el.classList]
})
console.table(classes)
```

The weak point here is that all random generated classes have the same length... 12 characters length.

So we can remove duplicates and filter our `classes` content to get the random classes used:

```javascript
// removes the duplicates and takes only the 12 length class names
const suspiciousClasses = [...new Set(classes)].filter(i => i.length === 12)
```

This reduces the 220 count to around 30. But includes some legitim class names that match our "twelve characters length" rule. We can remove them if we notice that the random classes don't use whitespaces or underscores.

```javascript
// removes 12 characters length class names with whitespaces or underscores
const randomClasses = suspiciousClasses.filter(i => !(/\s|_/).test(i))
```

And now we can just find the elements that use those classes and remove them:

```javascript
// remove all suspicious elements
suspiciousClasses.forEach(className => {
  try {
    const elements = document.querySelectorAll(`div.${className}`)
    elements.forEach(el => {
      console.log('removing suspicious element...')
      el.parentNode.removeChild(el)
    })
  } catch (err) {
    console.error('error', err.message)
  }
})
```

I wrap the code into a `try/catch` block because some random generated classes will produce a javascript error (`div.123random`), because it seems querySelectors can't start with a number. We could write the sentence like this `document.querySelectorAll("[class='123random']")` and it would work, but I prefer the `try/catch` approach.

So, I have grouped all this logic into a function and added it to the current flow of my [agm-chrome-extension](https://chrome.google.com/webstore/detail/agm-chrome-extension/bpjmkofdilcfhaafpkokkanpppcblddf):

```javascript
const removeSuspiciousElements = () => {
  const isSuspicious = className => className.length === 12 && !(/\s|_/).test(className)

  let rawClasses = [];
  document.querySelectorAll('div').forEach(el => {
    rawClasses = [...rawClasses, ...el.classList]
  })
  // remove duplicates
  const uniqueClasses = [...new Set(rawClasses)]
  const suspiciousClasses = uniqueClasses.filter(isSuspicious)

  // remove all suspicious elements
  suspiciousClasses.forEach(className => {
    try {
      const elements = document.querySelectorAll(`div.${className}`)
      elements.forEach(el => {
        console.log('removing suspicious element...')
        el.parentNode.removeChild(el)
      })
    } catch (err) {
      console.error('error', err.message)
    }
  })
}
```

And it just works :D

So now I can continue reading news without disturbing and useless warnings :)

## What if they randomize the length of the generated classes?

I have two ideas to solve this problem, but I would have to explore it to check if they are viable. I'll do it when they evolve their banners in this direction.

1. Download and parse the stylesheets. The random generated classes won't be there, so we could get all document classes and discard all classes present on the stylesheets.

2. Use some dictionary or apply some kind of machine learning to identify random strings, then process the classes to find the random ones.
