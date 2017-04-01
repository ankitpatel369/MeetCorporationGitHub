using MeetCorporation.Repository;
using MeetCorporation.Repository.Services;
using MeetCorporation.Repository.ServicesContext;
using MeetCorporation.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MeetCorporation.Controllers
{
    public class SignInController : Controller
    {
        IClientMasterRepository _Client = new ClientMasterRepository(new MeetCorporationEntities());

        public ActionResult Index()
        {
            return View();
        }


        public JsonResult SaveUser(MST_User model)
        {
            try
            {
                model.OTP = CommonMethods.RendomNumber().ToString();
                Int32 Result = _Client.SaveUser(model);
                return Json(new { Result });
            }
            catch (Exception ex)
            {
                return null;

            }
        }

        public JsonResult SignIn(string UserName, string OTP)
        {
            try
            {
                return Json(true, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult CheckUser(string UserName)
        {
            try
            {
                if (_Client.CheckUser(UserName) == 0)
                {
                    return Json(1, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(0, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                return Json(-1, JsonRequestBehavior.AllowGet);
            }
        }

    }
}
