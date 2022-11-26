package sara.tedwon;

import sara.tedwon.models.Memo;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.*;

@Path("/memo")
@Produces(MediaType.APPLICATION_JSON)
public class MemoResource {

    static final Set<Memo> memoSet = Collections.synchronizedSet(new HashSet<>());

    static {
        memoSet.add(new Memo("Pick up Sara at 2:45 pm"));
    }

    @GET
    public Set<Memo> get() {
        System.out.println("get");
        return memoSet;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("all")
    public Set<Memo> create(Set<Memo> memos) {
        System.out.println(memos);
        memoSet.addAll(memos);
        return memoSet;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Set<Memo> create(Memo memo) {
        System.out.println("create: " + memo);
        memoSet.add(memo);
        System.out.println("memoSet: " + memoSet);

        return memoSet;
    }

    @DELETE
    @Consumes(MediaType.APPLICATION_JSON)
    public Boolean delete(Memo memo) {
        System.out.println("delete: " + memo);
        return memoSet.remove(memo);
    }
}