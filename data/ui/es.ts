import siteMetadata from '@/data/siteMetadata'

const esUi = {
  meta: {
    home: {
      title: 'Ingeniero de Software | Frontend, Cloud, IA | Marcelo Carmona',
      description:
        'Notas de ingeniería de software sobre productos web, arquitectura frontend, infraestructura cloud y entrega mantenible por Marcelo Carmona.',
    },
    blog: {
      title: 'Blog en español',
      description: `Artículos en español de ${siteMetadata.author} sobre React, Next.js, rendimiento web y arquitectura frontend.`,
    },
    blogPage: (pageNumber: number) => ({
      title: `Blog en español - Página ${pageNumber}`,
      description: `Artículos en español de ${siteMetadata.author} sobre React, Next.js, rendimiento web y arquitectura frontend.`,
    }),
    tags: {
      title: 'Etiquetas',
      description:
        'Explora los artículos en español por tema: React, TypeScript, JavaScript, RxJS, webpack y AngularJS.',
    },
    tag: (tag: string, postCount: number) => ({
      title: tag,
      description: `Explora ${postCount} ${postCount === 1 ? 'artículo etiquetado' : 'artículos etiquetados'} con ${tag} por ${siteMetadata.author}.`,
    }),
    about: {
      title: 'Acerca de mí',
      description: `${siteMetadata.author} es ingeniero de software enfocado en arquitectura frontend, React, Next.js y rendimiento web.`,
    },
    book: {
      title: 'Reservar llamada',
      description: `Reserva una llamada con ${siteMetadata.author}. Elige un horario que funcione para ti y la reunión se confirma automáticamente.`,
    },
    guides: {
      title: 'Guías',
      description: 'Rutas de aprendizaje sobre React, arquitectura frontend y rendimiento web.',
    },
    watch: {
      // lib/video.ts falls back to "Video" for untitled videos; don't render "Video (Video)".
      title: (videoTitle: string) =>
        videoTitle === 'Video' ? videoTitle : `${videoTitle} (Video)`,
      description: (summary: string) => `Mira el video: ${summary}`,
    },
  },
  footer: {
    bookCall: 'Reservar llamada',
    contact: 'Contacto',
    eyebrow: 'Ingeniería de software',
    privacy: 'Privacidad',
    summary:
      'Notas y trabajo práctico sobre arquitectura frontend, infraestructura cloud, flujos de entrega y las decisiones de ingeniería detrás de software mantenible.',
    title: 'Productos web que aguantan en producción.',
    trustLinksLabel: 'Páginas de confianza y contacto',
  },
  list: {
    noPostsFound: 'No se encontraron artículos.',
    paginationStatus: (currentPage: number, totalPages: number) =>
      `${currentPage} de ${totalPages}`,
    previousPage: 'Anterior',
    publishedOn: 'Publicado el',
    searchArticles: 'Buscar artículos',
    nextPage: 'Siguiente',
    updatedOn: 'Actualizado',
  },
  navigation: {
    about: 'Acerca',
    blog: 'Blog',
    book: 'Reservar',
    guides: 'Guías',
    tags: 'Etiquetas',
  },
  post: {
    authors: 'Autores',
    backToBlog: 'Volver al blog',
    blogLabel: 'Blog',
    contents: 'Contenido',
    homeLabel: 'Inicio',
    name: 'Nombre',
    nextArticle: 'Artículo siguiente',
    previousArticle: 'Artículo anterior',
    publishedOn: 'Publicado el',
    relatedArticles: 'Artículos relacionados',
    tags: 'Etiquetas',
    twitter: 'Twitter',
    translations: 'También disponible en',
    updatedOn: 'Actualizado',
    viewOnGitHub: 'Ver en GitHub',
  },
  video: {
    articleEyebrow: 'Resumen en video',
    articleHelper: 'Una versión breve en video de este artículo.',
    articleLabel: 'Artículo',
    backToArticle: 'Volver al artículo',
    homeLabel: 'Inicio',
    readArticle: 'Leer el artículo completo',
    translations: 'También disponible en',
    watchOnYouTube: 'Ver en YouTube',
    watchPageCta: 'Ver el video',
    watchPageLabel: 'Video',
  },
  scroll: {
    toComment: 'Ir a comentarios',
    toTop: 'Ir arriba',
    viewAsMarkdown: 'Ver este artículo como Markdown para agentes de IA',
  },
}

export default esUi
