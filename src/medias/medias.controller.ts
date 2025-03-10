import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  StreamableFile,
  Headers,
  UploadedFiles,
  Request,
  Param,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import Express from 'express';

import 'multer';
 
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { ApiBody, ApiTags } from '@nestjs/swagger';

export const editFileName = (req, file, callback) => {
  const fileExtName = extname(file.originalname);
 
  // const randomName = `${(Math.random() + 1)
  //     .toString(36)
  //     .substring(7)
  //     .toLocaleUpperCase()}`;

  const randomName =     Date.now().toString(36) + Math.random().toString(36).substring(2);
  callback(null, `${randomName}${fileExtName}`);
};

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

@Controller('documents')
// @ApiTags('documents')
export class MediasController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('document', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  @ApiBody({
    schema:{
      type:'object',
      properties:{
        photo:{
          type:'string',
          format:'binary',
        }
      }
    }
  })
  uploadSingle(@UploadedFile() file,@Headers() header) {
    const  origin =header.host

    const url = `http://${origin}/documents/${file.filename}`;
   
    const response = {
      originalname: file.originalname,
      filename: file.filename,
      url
    };

    console.log({response})
    return response;
  }
  @Get(":name")
  getFile(@Param() params): StreamableFile {
    const file = createReadStream(join(process.cwd(), `uploads/${params.name}`));
    return new StreamableFile(file);
  }
}
