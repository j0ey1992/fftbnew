import type { ComponentCategory, DAppComponent } from '@/types/dapp-builder';

export const componentLibrary: Record<ComponentCategory, DAppComponent[]> = {
  Layout: [
    {
      id: '',
      type: 'header',
      category: 'Layout',
      props: {},
      content: 'Header',
      style: {
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
      },
    },
    {
      id: '',
      type: 'footer',
      category: 'Layout',
      props: {},
      content: 'Footer',
      style: {
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #dee2e6',
        marginTop: 'auto',
      },
    },
    {
      id: '',
      type: 'navigation',
      category: 'Layout',
      props: {},
      style: {
        padding: '10px 20px',
        backgroundColor: '#343a40',
        color: '#ffffff',
      },
    },
    {
      id: '',
      type: 'sidebar',
      category: 'Layout',
      props: {},
      style: {
        width: '250px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
      },
    },
    {
      id: '',
      type: 'container',
      category: 'Layout',
      props: {},
      style: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
      },
    },
    {
      id: '',
      type: 'section',
      category: 'Layout',
      props: {},
      style: {
        padding: '40px 20px',
      },
    },
    {
      id: '',
      type: 'row',
      category: 'Layout',
      props: {},
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
      },
    },
    {
      id: '',
      type: 'column',
      category: 'Layout',
      props: {},
      style: {
        flex: '1',
        minWidth: '250px',
      },
    },
  ],
  Content: [
    {
      id: '',
      type: 'hero',
      category: 'Content',
      props: {},
      content: 'Welcome to Your dApp',
      style: {
        padding: '80px 20px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
      },
    },
    {
      id: '',
      type: 'card',
      category: 'Content',
      props: {
        title: 'Card Title',
      },
      content: 'Card content goes here',
      style: {
        padding: '20px',
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    },
    {
      id: '',
      type: 'heading',
      category: 'Content',
      props: {
        level: 'h2',
      },
      content: 'Heading',
      style: {
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '16px',
      },
    },
    {
      id: '',
      type: 'paragraph',
      category: 'Content',
      props: {},
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      style: {
        marginBottom: '16px',
        lineHeight: '1.6',
      },
    },
    {
      id: '',
      type: 'text',
      category: 'Content',
      props: {},
      content: 'Text content',
      style: {},
    },
    {
      id: '',
      type: 'image',
      category: 'Content',
      props: {
        src: 'https://via.placeholder.com/300x200',
        alt: 'Placeholder image',
      },
      style: {
        maxWidth: '100%',
        height: 'auto',
      },
    },
    {
      id: '',
      type: 'video',
      category: 'Content',
      props: {
        src: '',
        controls: true,
      },
      style: {
        width: '100%',
        maxWidth: '800px',
      },
    },
  ],
  Forms: [
    {
      id: '',
      type: 'form',
      category: 'Forms',
      props: {},
      style: {
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
      },
    },
    {
      id: '',
      type: 'input',
      category: 'Forms',
      props: {
        type: 'text',
        placeholder: 'Enter text',
        label: 'Input Field',
      },
      style: {},
    },
    {
      id: '',
      type: 'button',
      category: 'Forms',
      props: {},
      content: 'Button',
      style: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      },
    },
  ],
  Navigation: [
    {
      id: '',
      type: 'link',
      category: 'Navigation',
      props: {
        href: '#',
      },
      content: 'Link',
      style: {
        color: '#007bff',
        textDecoration: 'none',
      },
    },
    {
      id: '',
      type: 'tabs',
      category: 'Navigation',
      props: {},
      style: {
        borderBottom: '2px solid #dee2e6',
      },
    },
  ],
  'Data Display': [
    {
      id: '',
      type: 'table',
      category: 'Data Display',
      props: {},
      style: {
        width: '100%',
        borderCollapse: 'collapse',
      },
    },
    {
      id: '',
      type: 'list',
      category: 'Data Display',
      props: {},
      style: {
        padding: '0',
        margin: '0',
        listStyle: 'none',
      },
    },
    {
      id: '',
      type: 'grid',
      category: 'Data Display',
      props: {},
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
      },
    },
  ],
  Feedback: [
    {
      id: '',
      type: 'modal',
      category: 'Feedback',
      props: {},
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      },
    },
  ],
  Media: [
    {
      id: '',
      type: 'carousel',
      category: 'Media',
      props: {},
      style: {
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
      },
    },
    {
      id: '',
      type: 'gallery',
      category: 'Media',
      props: {},
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
      },
    },
  ],
  Other: [
    {
      id: '',
      type: 'divider',
      category: 'Other',
      props: {},
      style: {
        margin: '20px 0',
        border: 'none',
        borderTop: '1px solid #dee2e6',
      },
    },
    {
      id: '',
      type: 'spacer',
      category: 'Other',
      props: {
        height: '20px',
      },
      style: {},
    },
    {
      id: '',
      type: 'accordion',
      category: 'Other',
      props: {},
      style: {
        border: '1px solid #dee2e6',
        borderRadius: '4px',
      },
    },
  ],
};