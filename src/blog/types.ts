export type BlogPost =
  | {
      kind: 'markdown'
      slug: string
      title: string
      date: string
      body: string
      summary?: string
    }
  | {
      kind: 'pdf'
      slug: string
      title: string
      date: string
      url: string
      description?: string
    }
