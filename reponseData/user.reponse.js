



exports.login_response = (data) => {

    return {
        _id: data._id,
        first_name: data.last_name,
        last_name: data.first_name,
        email: data.email,
        employee_id: data.employee_id,
        joining_date: data.joining_date,
        tokens: data.tokens,
        user_type: data.user_type,
        refresh_tokens: data.refresh_tokens,
        phone: data.phone,
        company: data.company,
        department: data.department,
        designation: data.designation
    }
}