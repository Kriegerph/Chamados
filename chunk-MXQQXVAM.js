function a(o){let e=o.contextoSistemaId?.trim(),i=o.sistemasRelacionados??[];return[...new Set(i.map(t=>t.trim()).filter(t=>t&&t!==e))]}export{a};
