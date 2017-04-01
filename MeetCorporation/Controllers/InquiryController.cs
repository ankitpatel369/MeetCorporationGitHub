using MeetCorporation.Repository;
using MeetCorporation.Repository.Services;
using MeetCorporation.Repository.ServicesContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MeetCorporation.Controllers
{
    public class InquiryController : Controller
    {
        IClientMasterRepository _Client = new ClientMasterRepository(new MeetCorporationEntities());

        //
        // GET: /Inquiry/

        public ActionResult Index()
        {
            return View();
        }

        public JsonResult SaveInquiry(Inquiry model)
        {
            try
            {
                Int32 Result = _Client.SaveInquiry(model);
                return Json(new { Result });
            }
            catch (Exception ex)
            {
                return null;

            }
        }

    }
}
