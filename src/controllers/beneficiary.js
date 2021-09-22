module.exports = class beneficiaryController {

static async createBeneficiary(req, res) {
  try {
    const { account_bank, account_number, amount, narration, reference, callback_url, debit_currency, currency } = req.body
    const state = await Repo.get_resource('states', state_id)
    if (!state) return errorResponse(res, responseCode.BAD_REQUEST, 'state does not exist')
    const result = await Repo.add_resource('base_bus_stops', 'name, is_dummy, state_id, description, created_at, updated_at', [name, is_dummy || 0, state_id, description, new Date(Date.now()), new Date(Date.now())])
    return successResponse(res, responseCode.CREATED, 'base_bus_stop has been added.', await Repo.get_resource('base_bus_stops', result.insertId))
  } catch (err) {
    console.log(err)
    return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'An error occurred.', err)
  }
}

}