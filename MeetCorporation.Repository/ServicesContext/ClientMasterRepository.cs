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

        public void Dispose()
        {
            throw new NotImplementedException();
        }
    }
}
