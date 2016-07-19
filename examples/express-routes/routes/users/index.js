'use strict'

module.exports = userRoute

function userRoute() {
    this.get('/:id', function (req, res) {
        var id = Number(req.params.id)

        if (id > 0) {
            var body = {
                status: 'success',
                data:   {
                    id:   id,
                    name: 'jdoe',
                    displayName: 'John Doe'
                }
            }
            res.json(body)
        }
        else {
            body = {
                status:  'error',
                message: 'No user found with the given id.'
            }
            res.status(404)
               .json(body)
        }
    })
}
