'use strict'

module.exports = postRoute

function postRoute() {
    this.get('/:id', function (req, res) {
        var id = Number(req.params.id)

        if (id > 0) {
            var body = {
                status: 'success',
                data:   {
                    id:   id,
                    text: 'lorem ipsum'
                }
            }
            res.json(body)
        }
        else {
            body = {
                status:  'error',
                message: 'No post found with the given id.'
            }
            res.status(404)
               .json(body)
        }
    })
}
