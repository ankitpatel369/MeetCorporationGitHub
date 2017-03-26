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
    public class ContactUsController : Controller
    {
        IClientMasterRepository _Client = new ClientMasterRepository(new MeetCorporationEntities());

        public ActionResult Index()
        {
            return View();
        }

        public JsonResult SaveContact(Contact model)
        {
            try
            {
                Int32 Result = _Client.SaveContact(model);
                return Json(new {Result});
            }
            catch (Exception ex)
            {
                return null;

            }
        }
    }
}
