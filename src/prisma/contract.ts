import { defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({}, ({ field, model, rel }) => {
  const User = model('User', {
    fields: {
      id: field.id.text(),
      isAdmin: field.boolean(),
      isBanned: field.boolean(),
    },
  });

  const Course = model('Course', {
    fields:{
      id: field.id.uuidv7String(),
      title: field.text(),
      catalogCode: field.text(),
    }
  });

  const Syllabi = model('Syllabi', {
    fields: {
      id: field.id.uuidv7String(),
      professor: field.text(),
      semester: field.text(),
      courseID: field.uuidv7String().references(() => Course.fields.id),
      fileID: field.text(),
      uploadDate: field.date(),
      uploader: field.text().references(() => User.fields.id),
    },
  });

  return {
    models: {
    },
  };
});
