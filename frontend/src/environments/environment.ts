const isLocalDemo = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

export const environment = {
  apiUrl: '/api/',
  focusUrl: '/process_image',
  isHostedPreview: !isLocalDemo,
  teacherCmsUrl: isLocalDemo
    ? 'http://localhost:1337/admin/content-manager/collectionType/api::content.content/create'
    : null,
};
