using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MeetCorporation.Repository.Services
{
    public interface IClientMasterRepository : IDisposable
    {
        Int32 SaveContact(Contact model);
    }
}
