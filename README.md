<!-- Tiêu đề -->
# Generation of module based on metadata

## Basic concept
- Framework (FW): Nestjs
- Language: Javascript, TypeScript
- Metadata: json config

## INPUT
```
{
    MICROSERVICE_NAME: "<parent-name>",
    <SUB-NAME-FOLDER>: {
        NAME: "sub-name",
        MICROSERVICE: <parent-name>,
        I18N: "sub-upper-name",
        QUERY: {
            FILTER_FIELD: [...],
            SEARCH_FIELD: [...],
            ORDER_FIELD: [...]
        },
        API: {
            GET_LIST: '<get-list-message-pattern>',
            GET_BY_ID: '<get-by-id-message-pattern>',
            POST: '<post-message-pattern>',
            PATCH: '<patch-message-pattern>',
            DELETE: '<delete-message-pattern>',
        }
    }
}
```

## Output
```
api/
    <parent-name>/
        <sub-name-1>/
            <sub-name-1>.controller.ts
            <sub-name-1>.module.ts
        <sub-name-2>/
            <sub-name-2>.controller.ts
            <sub-name-2>.module.ts
        <parent-name>.module.ts
        <parent-name>.controller.ts
```

## Todo
- [ ] Depend on input generate output structure
- [ ] Build template.txt for 4 kinds of file. Depend on it to generate content