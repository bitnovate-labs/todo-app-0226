# How rendering works in this app (Next.js SSR + RSC)

## Your assumption is correct

**Next.js is server-rendered.** In the App Router, by default:

- **Layouts and pages run on the server** for each request (navigation or refresh).
- The server runs your React tree, fetches data, and sends back **HTML + RSC payload** (not a blank shell that waits for client JS to load data).

So you get:

- **Faster first contentful paint** than a pure client-side React app (no “loading…” while JS loads and fetches).
- **SEO-friendly** HTML from the server.
- **One round-trip per navigation** to the server to get the new page and its data.

## Why it can still feel slow

1. **Every navigation is a server round-trip**  
   Clicking a link still does: **browser → your server → Supabase (auth + todos) → server → browser**. That’s one full request. SSR doesn’t make that request disappear; it just means the **response** is already-rendered HTML + data instead of an empty page that then fetches.

2. **Client Components still hydrate**  
   Parts of the UI that use `"use client"` (e.g. todo list, checkboxes, nav) are still Server Components at first: the server renders them and sends the result. Then the client downloads JS and **hydrates** those components so they become interactive. Until hydration finishes, you don’t get instant client-side transitions.

3. **We’ve made it faster by**  
   - **Fetching todos on the server** and passing them as `initialTodos` so the first paint already has the list (no client “Loading…”).  
   - **Caching on the client** (TanStack Query) so when you switch between Home / Week / History, the second time you see a page the data can come from cache.  
   - **Deduplicating auth** with `cache(getUserOrNull)` so layout, page, and BottomNav don’t each trigger a separate auth call in the same request.

## Summary

| What                         | Who runs it | When it runs                    |
|-----------------------------|------------|----------------------------------|
| Layout (auth, shell)        | Server     | Every request                    |
| Page (e.g. Home, Week)       | Server     | Every request                    |
| Todo fetch for initial list  | Server     | In the page, then sent as props  |
| Client components (list, nav) | Server then client | Server: first HTML; client: hydrate + interactivity |
| Subsequent navigations      | Server     | Each navigation = new request   |

So: **Yes, Next.js is SSR**, and the app is set up so the **first view of each page is server-rendered with data**. The remaining “slowness” is mostly the **network round-trip per navigation** and **hydration**, not the lack of SSR.
