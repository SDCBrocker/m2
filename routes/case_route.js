'use strict';
/**
 * Created by Akash Deep on 09/05/2019.
 */

const universal_functions = require('../utils/universal_functions');
const joi = require('joi');
const constant = require('../lib/constant');
const controller = require('../controllers')
module.exports = [
    {
        method: 'POST',
        path: '/case/feedback',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.case_controller.feedback(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'Feedback form ',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    text: joi.string().required(),
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/case/save_case',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.case_controller.save_case(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'Save case',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    name: joi.string().optional(),
                    case_id: joi.number().optional(),
                    case_save_name_id: joi.number().integer(),
                    is_save :joi.boolean().required().description('true means like and false means undo'),
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/case/edit_save_case',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.case_controller.edit_save_case(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'Save case',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    name: joi.string().optional(),
                    case_save_name_id: joi.number().integer().required(),
                    image: joi.string().optional(),
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/case/delete_collection',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.case_controller.delete_collection(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'Delete save collection',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    case_save_name_id: joi.number().integer()
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/case/delete_save_case',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.case_controller.delete_save_case(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'Delete Save Case inside collection',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    case_save_name_id: joi.number().integer(),
                    case_id: joi.number().integer()
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/case/get_page_content',
        handler:  async (request, reply) =>{
            let data = await controller.case_controller.page_content()
            return data
        },
        config: {
            description: 'get Page Content',
            tags: ['api', 'case'],
            validate: {
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/case/get_save_case',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let data = await controller.case_controller.get_save_case(userData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'get Save case',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/case/get_save_case_details',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let queryData = request.query;

            let data = await controller.case_controller.get_save_case_details(userData,queryData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'get Save case details',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                query: {
                    case_save_name_id: joi.number().integer().required(),
                    limit: joi.number().integer(),
                    skip :joi.number().integer()
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/case/comment',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.case_controller.add_comment(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'comment on case',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    comment: joi.string().required(),
                    case_id: joi.number().integer().required(),
                    parent_comment_id: joi.number().integer(),
                    user_tag_json: joi.array().items(
                        joi.object({
                            name: joi.string(),
                            other: joi.string(),
                            id: joi.number().integer()
                        })
                    )
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                   // payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/case/edit_comment',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.case_controller.edit_comment(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'edit comment on case',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    comment_id: joi.number().integer().required(),
                    comment: joi.string().required(),
                    user_tag_json: joi.array().items(
                        joi.object({
                            name: joi.string(),
                            other: joi.string(),
                            id: joi.number().integer()
                        })
                    )
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/case/delete_comment',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.case_controller.delete_comment(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'edit comment on case',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    comment_id: joi.number().integer().required(),
                    case_id: joi.number().integer().required(),
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/case/get_comment',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let queryData = request.query;

            let data = await controller.case_controller.get_comment(userData,queryData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'get comment list',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                query: {
                    case_id: joi.number().integer().required(),
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/case/report_case',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.case_controller.report_case(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'comment on case',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    case_id: joi.number().integer().required(),
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/case/report_comment',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.case_controller.report_comment(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'report comment',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    comment_id: joi.number().integer().required(),
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/case/hide_case',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            const payloadData = request.payload;
            let data = await controller.case_controller.hide_case(payloadData,userData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'Hide case',
            tags: ['api', 'case'],
            validate: {
                payload: {
                    case_id: joi.number().integer().required()
                },
                headers: universal_functions.authorizationHeaderObj,
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/case/answer_poll',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.case_controller.answer_poll(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'comment on case',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    case_id: joi.number().integer().required(),
                    case_url_id: joi.number().integer().required(),
                    answer: joi.number().integer().required().valid([1,2,3,4]),
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                     payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/case/create_event',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.case_controller.create_event(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'create event',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    event_save_id:joi.string(),
                    start_date:joi.string(),
                    end_date:joi.string(),
                    title:joi.string(),
                    time:joi.string(),
                    location:joi.string(),
                    latitude: joi.number(),
                    longitude: joi.number(),
                    description:joi.string(),
                    list_of_types:joi.array().items(joi.string()),
                    link:joi.string()
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                     payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/case/get_event',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let data = await controller.case_controller.get_event(userData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'get event list',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/case/delete_event',
        handler:  async (request, reply) =>{
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.case_controller.delete_event(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'delete event list',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    event_save_id: joi.number().integer().required(),
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
];