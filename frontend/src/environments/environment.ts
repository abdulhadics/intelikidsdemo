const isLocalDemo = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
const backendOrigin = document.querySelector<HTMLMetaElement>('meta[name="intellikids-backend"]')?.content || '';
const cmsOrigin = backendOrigin || (isLocalDemo ? 'http://localhost:1337' : '');

export const environment = {
  isStudentPreview: !isLocalDemo && !backendOrigin,
  apiUrl: backendOrigin + '/api/',
  mediaOrigin: backendOrigin,
  focusUrl: '/process_image',
  teacherCmsUrl: cmsOrigin
    ? cmsOrigin + '/admin/content-manager/collectionType/api::content.content/create'
    : null,
};
