import tempfile

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

'''
API_URL = 'https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url'
IMG_FILE = 'IMG_0542.JPG'
'''
def get_users():
    users = []
    images = []
    for x in db(db.auth_user.id == auth.user_id).select():
        usr = dict(
            first_name = x.first_name,
    	    last_name = x.last_name,
    	    user_id = x.id,
    	)
    	users.append(usr)
    for x in db(db.auth_user.id != auth.user_id).select():
        usr = dict(
            first_name = x.first_name,
    	    last_name = x.last_name,
    	    user_id = x.id,
    	)
    	users.append(usr)	
    for x in db(db.user_images.created_by == auth.user_id).select(orderby=~db.user_images.created_on):
        img = dict(
    	    image_url = x.image_url,
    	)
    	images.append(img)
    lgin = auth.user is not None	
    return response.json(dict(
        users = users,
        images = images,
        logged_in = lgin,
    ))

# Here go your api methods.
def get_user_images():
    q = (db.user_images.created_by == request.vars.user_id)
    i = db(q).select(orderby=~db.user_images.created_on)
    return response.json(dict(images = i))

@auth.requires_signature()
def add_image():
	img_id = db.user_images.insert(
        image_url = request.vars.image_url,
        price = request.vars.price,
	)
	img = db.user_images(img_id)
	return response.json(dict(
        user_images = img
    ))