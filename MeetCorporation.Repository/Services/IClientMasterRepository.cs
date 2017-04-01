using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MeetCorporation.Repository.Services
{
    public interface IClientMasterRepository : IDisposable
    {
        Int32 SaveContact(Contact model);
        Int32 SaveInquiry(Inquiry model);
        Int32 SaveUser(MST_User model);

        Int32 SignIn(string UserName, string OTP);

        Int32 CheckUser(string UserName);
    }
}
