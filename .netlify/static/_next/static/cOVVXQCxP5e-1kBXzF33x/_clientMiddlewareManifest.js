self.__MIDDLEWARE_MATCHERS = [
  {
    "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next\\/static|_next\\/image|api\\/|icons\\/|media\\/|manifest\\.json|sw\\.js|favicon\\.ico|\\.well-known|robots\\.txt|logo\\.svg|sitemap|uploads\\/|feed\\.xml).*))(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$",
    "originalSource": "/((?!_next/static|_next/image|api/|icons/|media/|manifest\\.json|sw\\.js|favicon\\.ico|\\.well-known|robots\\.txt|logo\\.svg|sitemap|uploads/|feed\\.xml).*)"
  }
];self.__MIDDLEWARE_MATCHERS_CB && self.__MIDDLEWARE_MATCHERS_CB()