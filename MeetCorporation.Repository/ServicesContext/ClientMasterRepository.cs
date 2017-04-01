using MeetCorporation.Repository.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MeetCorporation.Repository.ServicesContext
{
    public class ClientMasterRepository : IClientMasterRepository
    {
        private MeetCorporationEntities context;
        public ClientMasterRepository(MeetCorporationEntities _context)
        {
            this.context = _context;
        }

        public int SaveContact(Contact model)
        {
            context.Contacts.Add(model);
            Int32 Result = context.SaveChanges();
            return Result;
        }

        public int SaveInquiry(Inquiry model)
        {
            context.Inquiries.Add(model);
            Int32 Result = context.SaveChanges();
            return Result;
        }

        public int SaveUser(MST_User model)
        {
            context.MST_User.Add(model);
            Int32 Result = context.SaveChanges();
            return Result;
        }

        public int CheckUser(string UserName)
        {
            Int32 Result = context.MST_User.Where(x => x.UserName.Equals(UserName)).Count();
            return Result;
        }

        public int SignIn(string UserName, string OTP)
        {
            Int32 Result = context.MST_User.Where(x => x.UserName.Equals(UserName) && x.OTP.Equals(OTP) && x.Is_Active == true).Count();
            return Result;
        }

        //public int SignIn(string UserName, string OTP)
        //{
        //    Int32 Result = context.MST_User.Where(x => x.UserName.Equals(UserName) && x.OTP.Equals(OTP) && x.Is_Active == true).Count();
        //    return Result;
        //}


        private bool disposed = false;
        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed)
            {
                if (disposing)
                {
                    context.Dispose();
                }
            }
            this.disposed = true;
        }
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
