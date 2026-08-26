import type { Locale } from '@/types/content'

export type TrustPageKind = 'contact' | 'privacy'

export interface TrustPageSection {
  title: string
  paragraphs: string[]
}

export interface TrustPageCopy {
  title: string
  description: string
  intro: string
  sections: TrustPageSection[]
}

export const trustPages: Record<TrustPageKind, Record<Locale, TrustPageCopy>> = {
  contact: {
    en: {
      title: 'Contact',
      description:
        'Contact Marcelo Carmona about software engineering, web products, frontend architecture, cloud infrastructure, and AI tooling.',
      intro:
        'The simplest way to reach me is by email. You can also reserve a time on my calendar when a live conversation is more useful. I welcome specific questions about software engineering, product delivery, frontend architecture, cloud infrastructure, performance, and practical AI tooling.',
      sections: [
        {
          title: 'Ways to get in touch',
          paragraphs: [
            'Email works best for an introduction, a technical question, or a project outline. Booking a call is useful when the problem needs context, tradeoff discussion, or a screen-sharing session. The public social profiles linked on this site are another way to verify my identity and follow my technical work.',
          ],
        },
        {
          title: 'What to include',
          paragraphs: [
            'A useful first message explains the outcome you want, the current situation, the relevant technology, and any important timing constraints. Links to public documentation or a reproducible example are welcome. Please do not send passwords, API keys, customer records, production credentials, or other confidential data in an initial message.',
          ],
        },
        {
          title: 'What happens next',
          paragraphs: [
            'I will review the context and reply when the request is a reasonable match for my experience and availability. A first conversation is for understanding the problem and deciding whether there is a useful next step; it does not create a consulting engagement or a support agreement. Any scope, deliverables, access, or commercial terms should be documented separately before work begins.',
          ],
        },
      ],
    },
    es: {
      title: 'Contacto',
      description:
        'Contacta a Marcelo Carmona sobre ingeniería de software, productos web, arquitectura frontend, infraestructura cloud y herramientas de IA.',
      intro:
        'La forma más sencilla de contactarme es por correo electrónico. También puedes reservar un horario en mi calendario cuando sea más útil conversar en vivo. Recibo preguntas concretas sobre ingeniería de software, entrega de productos, arquitectura frontend, infraestructura cloud, rendimiento y herramientas prácticas de IA.',
      sections: [
        {
          title: 'Formas de contactar',
          paragraphs: [
            'El correo funciona mejor para una presentación, una pregunta técnica o el resumen de un proyecto. Reservar una llamada es útil cuando el problema necesita contexto, una conversación sobre decisiones o compartir pantalla. Los perfiles públicos enlazados en este sitio también permiten verificar mi identidad y seguir mi trabajo técnico.',
          ],
        },
        {
          title: 'Qué información incluir',
          paragraphs: [
            'Un primer mensaje útil explica el resultado que buscas, la situación actual, la tecnología relevante y cualquier restricción importante de tiempo. Puedes incluir documentación pública o un ejemplo reproducible. No envíes contraseñas, claves de API, datos de clientes, credenciales de producción ni otra información confidencial en el primer mensaje.',
          ],
        },
        {
          title: 'Qué ocurre después',
          paragraphs: [
            'Revisaré el contexto y responderé cuando la solicitud encaje razonablemente con mi experiencia y disponibilidad. La primera conversación sirve para entender el problema y decidir si existe un siguiente paso útil; no crea un acuerdo de consultoría ni de soporte. El alcance, los entregables, los accesos y los términos comerciales deben documentarse por separado antes de comenzar cualquier trabajo.',
          ],
        },
      ],
    },
  },
  privacy: {
    en: {
      title: 'Privacy',
      description:
        'Privacy information for marcelocarmona.com, including analytics, comments, booking, and direct communications.',
      intro:
        'This notice explains what can happen to information when you visit marcelocarmona.com or choose to contact me. The site publishes technical articles and professional information. It does not currently offer user accounts, paid checkout, or an active newsletter signup. This notice was last updated on August 26, 2026.',
      sections: [
        {
          title: 'Information processed during a visit',
          paragraphs: [
            'The hosting and security infrastructure may process ordinary request information needed to deliver the site, such as the requested page, timestamp, browser or device details, referrer, network information, and approximate location. The site also uses Google Analytics, Vercel Web Analytics, and Vercel Speed Insights to understand aggregate usage, reliability, and performance. Those providers may use cookies or similar browser storage according to their own services and settings.',
          ],
        },
        {
          title: 'Information you choose to provide',
          paragraphs: [
            'If you send email, I receive the address, message, and attachments you choose to provide through your email service. If you book a call, Cal.com processes the scheduling details you submit. Article comments use giscus, which connects to GitHub Discussions and may require a GitHub account. These services process information under their own terms and privacy practices.',
          ],
        },
        {
          title: 'How information is used',
          paragraphs: [
            'Visit information is used to operate, secure, measure, and improve the site. Direct communications are used to answer the request, prepare for a scheduled conversation, maintain appropriate business records, and follow up on work you ask about. Information may also be preserved or disclosed when reasonably necessary to protect the site, prevent abuse, or comply with a legal obligation.',
          ],
        },
        {
          title: 'Your choices and questions',
          paragraphs: [
            'You can limit optional analytics through browser privacy controls, content blockers, or cookie settings. You can read the published content without creating an account or commenting. Avoid sending sensitive information until there is an agreed reason and secure method to share it. For a privacy question about this site or a request concerning a direct communication, use the contact details below and describe enough context to locate the relevant record.',
          ],
        },
      ],
    },
    es: {
      title: 'Privacidad',
      description:
        'Información de privacidad de marcelocarmona.com, incluyendo analítica, comentarios, reservas y comunicaciones directas.',
      intro:
        'Este aviso explica qué puede ocurrir con la información cuando visitas marcelocarmona.com o decides contactarme. El sitio publica artículos técnicos e información profesional. Actualmente no ofrece cuentas de usuario, pagos ni un formulario activo de suscripción. Este aviso fue actualizado por última vez el 26 de agosto de 2026.',
      sections: [
        {
          title: 'Información procesada durante una visita',
          paragraphs: [
            'La infraestructura de alojamiento y seguridad puede procesar información normal de una solicitud para entregar el sitio, como la página solicitada, la hora, detalles del navegador o dispositivo, la referencia, información de red y ubicación aproximada. El sitio también utiliza Google Analytics, Vercel Web Analytics y Vercel Speed Insights para entender el uso agregado, la fiabilidad y el rendimiento. Esos proveedores pueden usar cookies o almacenamiento similar según sus propios servicios y configuraciones.',
          ],
        },
        {
          title: 'Información que decides proporcionar',
          paragraphs: [
            'Si envías un correo, recibo la dirección, el mensaje y los archivos que decidas proporcionar mediante tu servicio de correo. Si reservas una llamada, Cal.com procesa los datos de agenda que envías. Los comentarios de los artículos usan giscus, que se conecta con GitHub Discussions y puede requerir una cuenta de GitHub. Estos servicios procesan información de acuerdo con sus propios términos y prácticas de privacidad.',
          ],
        },
        {
          title: 'Cómo se utiliza la información',
          paragraphs: [
            'La información de las visitas se utiliza para operar, proteger, medir y mejorar el sitio. Las comunicaciones directas se usan para responder a la solicitud, preparar una conversación reservada, mantener registros profesionales apropiados y dar seguimiento al trabajo consultado. La información también puede conservarse o divulgarse cuando sea razonablemente necesario para proteger el sitio, prevenir abusos o cumplir una obligación legal.',
          ],
        },
        {
          title: 'Tus opciones y preguntas',
          paragraphs: [
            'Puedes limitar la analítica opcional mediante los controles de privacidad del navegador, bloqueadores de contenido o ajustes de cookies. Puedes leer el contenido publicado sin crear una cuenta ni comentar. Evita enviar información sensible hasta que exista un motivo acordado y un método seguro para compartirla. Para una pregunta de privacidad o una solicitud sobre una comunicación directa, usa los datos de contacto indicados abajo y aporta el contexto necesario para localizar el registro correspondiente.',
          ],
        },
      ],
    },
  },
}

export function getTrustPageCopy(kind: TrustPageKind, locale: Locale): TrustPageCopy {
  return trustPages[kind][locale]
}
