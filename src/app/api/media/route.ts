import { getSession, requireAuth } from '@/lib/authActions';
import { fetchData } from '@/lib/functions';
import { postMedia } from '@/models/mediaModel';
import { MediaResponse, UploadResponse } from 'hybrid-types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  requireAuth();
  try {
    // TODO: get the form data from the request
    const formData = await request.formData();
    // console.log(formData);
    // TODO: get the token from the cookie
    const token = request.cookies.get('session')?.value;
    // console.log('session', token);
    if (!token) {
      return new NextResponse('Unathorized', { status: 401 });
    }
    // TODO: send the form data to the uppload server. See apiHooks from previous classes.
    const options = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      body: formData,
    };
    const uploadResult = await fetchData<UploadResponse>(
      process.env.UPLOAD_SERVER + '/upload',
      options,
    );
    // TODO: if the upload response is not valid, return an error response with NextResponse
    if (!uploadResult.data) {
      return new NextResponse('Error uploading media', { status: 500 });
    }
    // TODO: get title and description from the form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    // TODO: get the filename, filesize and media_type  from the upload response
    // TODO: get user_id from getSession() function
    // TODO: create a media item object, see what postMedia funcion in mediaModel wants for input.
    // TODO: use the postMedia function from the mediaModel to add the media to the database. Since we are putting data to the database in the same app, we dont need to use a token.

    const tokenContent = await getSession();
    if (!tokenContent) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const media = {
      title,
      description,
      filename: uploadResult.data.filename,
      filesize: uploadResult.data.filesize,
      media_type: uploadResult.data.media_type,
      user_id: tokenContent.user_id,
    };

    const postResult = await postMedia(media);

    if (!postResult) {
      return new NextResponse('Error adding media to database', {
        status: 500,
      });
    }

    const uploadResponse: MediaResponse = {
      message: 'Media added to database',
      media: postResult,
    };

    return new NextResponse(JSON.stringify(uploadResponse), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error((error as Error).message, error);
    return new NextResponse((error as Error).message, { status: 500 });
  }
}