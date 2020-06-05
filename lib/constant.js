

const status_msg = {
    success: {
        created: {
            statusCode:201,
            customMessage : 'Created Successfully',
            type : 'CREATED'
        },
        default: {
            statusCode:200,
            customMessage : 'Success',
            type : 'DEFAULT'
        },
        UPDATED: {
            statusCode:200,
            customMessage : 'Updated Successfully',
            type : 'UPDATED'
        },
        LOGOUT: {
            statusCode:200,
            customMessage : 'Logged Out Successfully',
            type : 'LOGOUT'
        },
        DELETED: {
            statusCode:200,
            customMessage : 'Deleted Successfully',
            type : 'DELETED'
        }
    }
}


const swagger_msg = [
    {code: 200, message: 'OK'},
    {code: 400, message: 'Bad Request'},
    {code: 401, message: 'Unauthorized'},
    {code: 404, message: 'Data Not Found'},
    {code: 500, message: 'Internal Server Error'}
];


const  status_error = {
    imp_error: {
        statusCode:500,
        customMessage : 'Implementation Error',
        type : 'IMP_ERROR'
    },
    invalid_token: {
        statusCode:401,
        customMessage : 'Invalid token provided',
        type : 'INVALID_TOKEN'
    }
}
const msg = {
    userNotFind :'User not found',
    emailNotFind :'Email not found',
    passwordNotFind :'Password doesn"t match ',
    otpAlreadyVerified:'OTP already verified',
    wrongOtp:'You entered wrong OTP',
    emailExist:'Email already exists',
    loginType:'Login Id already exists',
    usernameExist:'Username already exists',
    accountNotApprove:'Your account is under review by Chime team',
    accountBlock:'Your account block by Chime team',
    accountReject:'Your account has been rejected by the admin',
    likeAlready:'Your already like this case',
    dislikeAlready:'Your already dislike this case',
    caseAlreadyAdded:'You have already added this case ',
    caseAlreadyAddedName:'You have already added this case name',
    caseAlreadyUnSave:'You have already un save this case',
    userAlreadyReported:'You have already report about this surgeon',
    caseAlreadyReported:'You have already report about this case',
    commentAlreadyReported:'You have already report about this comment',
    caseAlreadyHide:'You have already hide this case',
    muteAlready:'Your already mute this user',
    unMuteAlready:'Your already unmute this user',
    followAlready:'Your already follow this user',
    unfollowAlready:'Your already unfollow this user',
    block:'Your already block this user',
    selfBlockUnblock:`You can't block or unblock your self`,
    unblock:'Your already unblock this user',

}
const  device_type = {
    ios:'ios',
    android:'android'

}
const  login_type = {
    okta:'okta',
    gps:'gps'

}



const email_msg = {
    register :'You are registered but a site administrator must review your account, you will not be able to login until your account has been approved.',
    account_approve :'Congratulations your accoount approved by Chime app.',
    register_subject :"You're Almost There",
    account_approve_subject:'Congratulations Exactech Account Approve.',
    account_reject :'Sorry your account not approve by Chime Team. ',
    account_reject_subject:'Sorry Chime Account Not Approve.',
    login_otp:'Your Login OTP For Chime Account.',
    forgot_otp:'Your forgot OTP For Chime Account.',
    admin_email:'New Chime Post Needs Approval'
}

const push_msg = {
    comment:'{{name}} commented on your case ',
    comment_other:`{{name}} commented on {{caseUser}}'s case `,
    tag:'{{name}} tagged you on a case ',
    case_like:'{{name}} liked your case ',
    case_approved:'Your post has been approved.',
    case_rejected:'Your post has been rejected.',
    case_add:"You added one case",
    case_like_me:"You liked a case",
    case_unlike_me:"You unliked a case",
    report:"You reported about a user",
    follow:"You follow a user",
    follow_you:"Someone follow  you",
    comment_me:"You commented on a case",
    save_case:"You saved a case",
    answer_poll:"{{name}} answered your poll",
    event:"Event created",
    admin_event:"Exactech added a private event for you",
    rejectTitle:"Post needs attention",
    approveTitle:"Success!",
    email_approve:'New Chime Post Needs Approval'

}

const email_template = {
    register:"<!DOCTYPE html> <html> <head>  <title>Register</title> " +
    "</head> <body> {{username}},  <p>Thanks for requesting access to Chime app. We will verify your account within 24 hours. Keep an eye on your inbox for an email from us that will tell you how to complete your registration. In the meantime, feel free to browse the app as a Guest." +
    "</p> <p>If you have any questions, please contact us at chime@exac.com. </p> <p>Thank You </p>  " +
    "</body> </html> ",
    account_approve:"<!DOCTYPE html> <html> <head>  <title>Account Approve</title> " +
    "</head> <body> You're In! {{username}}  <p> Welcome to Chime app! Learning from other clinicians is about to get a whole lot easier. </p>  <p> " +
    " If you have any questions, please contact us at chime@exac.com. </p> <p>Thank You </p>  " +
    "</body> </html> ",
    account_reject:"<!DOCTYPE html> <html> <head>  <title>Account Reject</title> " +
    "</head> <body>  Hi,  <p>Sorry your account not approve by Chime Team . {{comment}}</p> <p>Thank You </p>  " +
    "</body> </html> ",
    login_otp:"<!DOCTYPE html> <html> <head>  <title>Login OTP</title> " +
    "</head> <body>  You're In! {{username}}  <p> To complete your registration, enter the four digit code below  {{otp}}</p> <p>Thank You </p>  " +
    "</body> </html> ",
    forgot_otp:"<!DOCTYPE html> <html> <head>  <title>Forgot OTP</title> " +
    "</head> <body>  You're In! {{username}}  <p> To complete your forgot password , enter the four digit code below  {{otp}}</p> <p>Thank You </p>  " +
    "</body> </html> ",
    admin_approve_case:"<!DOCTYPE html> <html> <head>  <title>New Chime Post Needs Approval</title> " +
    "</head> <body> Hi, <p>  <a href = {{url}} >Click </a> here to start reviewing </p> <p>Thank You </p>  " +
    "</body> </html> "
}

        module.exports = {
            status_msg:status_msg,
            swagger_msg:swagger_msg,
            status_error:status_error,
            device_type:device_type,
            msg:msg,
            email_msg:email_msg,
            email_template:email_template,
            push_msg:push_msg,
            login_type:login_type
        }
