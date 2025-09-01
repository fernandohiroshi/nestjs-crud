import 'reflect-metadata';
import { SetRoutePolicy } from './set-route-policy-decorator';
import { ROUTE_POLICY_KEY } from '../auth.constants';
import { RoutePolicies } from '../enum/route-policies.enum';

describe('SetRoutePolicy Decorator', () => {
  it('should define the correct metadata on a class', () => {
    const testPolicy = RoutePolicies.findAllMessages;
    const decorator = SetRoutePolicy(testPolicy);
    expect(typeof decorator).toBe('function');

    @decorator
    class TestClass {}
    const metadata = Reflect.getMetadata(ROUTE_POLICY_KEY, TestClass);
    expect(metadata).toBe(testPolicy);
  });
});
