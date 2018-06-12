
import tempfile

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

@auth.requires_signature()
def add_post():
    image_id = db.pet_posts.insert(
        image_url = request.vars.image_url,
        # animal_type = request.vars.animal_type,
        # pet_name = request.vars.pet_name,
        # description = request.vars.description,
        # contact_info = request.vars.contact_infos
    )
    image = db.pet_posts(image_id)
    return response.json(dict(pet_posts = image))

def get_users():
    users = []
    images = []

    for r in db(db.auth_user.id == auth.user_id).select():
        u = dict(
            first = r.first_name,
            last = r.last_name,
            user_id = r.id,
        )
        users.append(u)

    for r in db(db.auth_user.id != auth.user_id).select():
        u = dict(
            first = r.first_name,
            last = r.last_name,
            user_id = r.id,
        )
        users.append(u)   

    for r in db(db.pet_posts.created_by == auth.user_id).select(orderby=~db.pet_posts.created_on):
        i = dict(
            image_url = r.image_url,
        )
        images.append(i)

    logged = auth.user is not None    
    return response.json(dict(
        users = users,
        images = images,
        logged_in = logged,
    ))

def get_pet_posts():
    cb = (db.pet_posts.created_by == request.vars.user_id)
    s = db(cbq).select(orderby=~db.pet_posts.created_on)
    return response.json(dict(images = si))

